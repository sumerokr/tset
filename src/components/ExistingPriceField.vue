<script lang="ts">
// 1.2345 -> 1.23
// 1.2456 -> 1.25
// 1.204 -> 1.20
// 4.3 -> 4.3
// 1.30 -> 1.3
// 1 -> 1.0
// No value -> 0.0

const short = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const long = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const format = (value: number) => {
  const isLong = String(value).split(".")[1]?.length > 1;
  return isLong ? long.format(value) : short.format(value);
};

export const validate = (data: {
  label: string;
  value: number | "";
}): data is PriceEntryData => {
  const { label, value } = data;
  return label.trim().length > 0 && Number(value) >= 0;
};

export const transform = (data: {
  label: string;
  value: number | "";
}): PriceEntryData => {
  const { label, value } = data;
  return {
    label: label.trim(),
    value: value === "" ? 0 : value,
  };
};
</script>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import type { PriceEntryData } from "@/App.vue";

const props = defineProps<{
  label: string;
  value: number;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "change", { label, value }: PriceEntryData): void;
  (e: "remove"): void;
}>();

const sameData = (data: PriceEntryData) => {
  return data.label === props.label && data.value === props.value;
};

// HTML refs for easier manipulation
const labelElement = ref<HTMLInputElement | null>(null);
const valueElement = ref<HTMLInputElement | null>(null);

const isLabelFocused = ref(false);
const isValueFocused = ref(false);
const inputType = ref<"text" | "number">("text");

const localLabel = ref<string>("");
const localValue = ref<number | "">("");

// use local refs when focused
const resolvedLabel = computed({
  get: () => (isLabelFocused.value ? localLabel.value : props.label),
  set: (newLabel) => (localLabel.value = newLabel),
});
const resolvedValue = computed({
  get: () => (isValueFocused.value ? localValue.value : format(props.value)),
  set: (newValue) =>
    (localValue.value = newValue === "" ? newValue : Number(newValue)),
});

const emitIfValid = () => {
  const data = {
    label: localLabel.value,
    value: localValue.value,
  };
  const isValid = validate(data);
  if (!isValid) {
    return;
  }
  const transformed = transform(data);
  if (sameData(transformed)) {
    return;
  }
  emit("change", transformed);
};

const startEditLabel = async () => {
  isLabelFocused.value = true;
  localLabel.value = props.label;
  localValue.value = props.value;
  await nextTick();
  labelElement.value?.select();
};
const startEditValue = async () => {
  if (props.readonly) {
    return;
  }
  isValueFocused.value = true;
  localLabel.value = props.label;
  localValue.value = props.value;
  inputType.value = "number";
  await nextTick();
  valueElement.value?.select();
};

const endEditLabel = () => {
  emitIfValid();
  isLabelFocused.value = false;
};
const endEditValue = async () => {
  if (props.readonly) {
    return;
  }
  emitIfValid();
  inputType.value = "text";
  await nextTick();
  isValueFocused.value = false;
};

const remove = () => {
  emit("remove");
};
</script>

<template>
  <div class="item">
    <!-- hide for the baseline -->
    <span v-if="!readonly" class="drag-handle action" title="sort">☰</span>
    <div v-if="!isLabelFocused" class="label-wrapper">
      <span class="label" :title="label" data-testid="static-label">{{
        label
      }}</span>
      <button
        v-if="!readonly"
        class="edit action"
        type="button"
        style="transform: rotateY(180deg)"
        title="edit"
        data-testid="label-switcher"
        @click="startEditLabel"
      >
        ✎
      </button>
    </div>
    <input
      v-else
      class="input-label input"
      ref="labelElement"
      v-model="resolvedLabel"
      type="text"
      data-testid="existing-label"
      @blur="endEditLabel"
      @keydown.esc="startEditLabel"
    />

    <input
      class="input-value input"
      ref="valueElement"
      v-model="resolvedValue"
      :type="inputType"
      :readonly="readonly"
      :title="!isValueFocused ? String(value) : ''"
      data-testid="existing-value"
      @focus="startEditValue"
      @blur="endEditValue"
      @keydown.esc="startEditValue"
    />
    <button
      class="action-remove action"
      v-if="!readonly"
      type="button"
      title="remove"
      @click="remove"
    >
      🗑
    </button>
  </div>
</template>

<style scoped>
.item {
  display: grid;
  gap: 1rem;
  grid-template-columns: 2.5rem 1fr 1fr 2.5rem;
  grid-template-areas: "drag label value remove";
}

.action {
  display: none;
  place-items: center;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 0.25rem;
  width: 40px;
  height: 40px;
}

.item:hover .action {
  display: grid;
}

.drag-handle {
  cursor: grab;
  grid-area: drag;
}

.label-wrapper {
  grid-area: label;
  display: flex;
}

.input-label {
  grid-area: label;
}

.label {
  padding: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.input-value {
  grid-area: value;
}

.input {
  padding: calc(0.5rem - 2px);
  font-size: 1rem;
  line-height: 1.5;
  border: 2px solid #444;
  border-radius: 0.25rem;
  color: #444;
}

.action-remove {
  grid-area: remove;
}
</style>
