<script lang="ts">
export const validate = (data: {
  label: string;
  value: number | "";
}): data is PriceEntryData => {
  const { label, value } = data;
  return label.trim().length > 0 && value !== "" && Number(value) >= 0;
};
</script>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { PriceEntryData } from "@/App.vue";

const emit = defineEmits<{
  (e: "change", { label, value }: PriceEntryData): void;
}>();

const labelElement = ref<HTMLInputElement | null>(null);

const label = ref<string>("");
const value = ref<number | "">("");

const onBlur = async () => {
  const data = {
    label: label.value,
    value: value.value,
  };
  const isValid = validate(data);
  if (!isValid) {
    return;
  }
  emit("change", data);
  label.value = "";
  value.value = "";

  await nextTick();
  labelElement.value?.focus();
  labelElement.value?.select();
};
</script>

<template>
  <div class="item">
    <input
      class="input-label input"
      v-model="label"
      type="text"
      data-testid="new-label"
      ref="labelElement"
      @blur="onBlur"
    />
    <input
      class="input-value input"
      v-model="value"
      type="number"
      data-testid="new-value"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.item {
  display: grid;
  gap: 1rem;
  grid-template-columns: 2.5rem 1fr 1fr 2.5rem;
  grid-template-areas: "drag label value remove";
}

.input-label {
  grid-area: label;
}

.input-value {
  grid-area: value;
}

.input {
  padding: calc(0.5rem - 2px);
  font-size: 1rem;
  line-height: 1.25;
  border: 2px solid #bbb;
  border-radius: 0.25rem;
  color: #bbb;
}
</style>
