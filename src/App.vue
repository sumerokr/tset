<script setup lang="ts">
import { computed, ref } from "vue";
import { Sortable as SortableComponent } from "sortablejs-vue3";
import type Sortable from "sortablejs";
import { nanoid } from "nanoid";

import ExistingPriceField from "@/components/ExistingPriceField.vue";
import NewPriceField from "@/components/NewPriceField.vue";

export type PriceEntry = {
  id: string;
  label: string;
  value: number;
};

export type PriceEntryData = Pick<PriceEntry, "label" | "value">;

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    alert(error.message);
  } else {
    alert("unlnown error");
  }
};

const api = {
  getPriceComponents: async (): Promise<PriceEntry[]> => {
    const response = await fetch("/getPriceComponents", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("API error");
    }
    return response.json() as Promise<PriceEntry[]>;
  },
  postPriceComponents: async (
    priceEntries: PriceEntry[]
  ): Promise<PriceEntry[]> => {
    const response = await fetch("/postPriceComponents", {
      method: "POST",
      body: JSON.stringify(priceEntries),
    });
    if (!response.ok) {
      throw new Error("API error");
    }
    return response.json() as Promise<PriceEntry[]>;
  },
  putPriceComponent: async (priceEntry: PriceEntry): Promise<PriceEntry[]> => {
    const response = await fetch("/putPriceComponent", {
      method: "PUT",
      body: JSON.stringify(priceEntry),
    });
    if (!response.ok) {
      throw new Error("API error");
    }
    return response.json() as Promise<PriceEntry[]>;
  },
  deletePriceComponent: async (
    priceEntry: PriceEntry
  ): Promise<PriceEntry[]> => {
    const response = await fetch("/deletePriceComponent", {
      method: "DELETE",
      body: JSON.stringify(priceEntry),
    });
    if (!response.ok) {
      throw new Error("API error");
    }
    return response.json() as Promise<PriceEntry[]>;
  },
};

const createPriceEntry = ({ label, value }: PriceEntryData): PriceEntry => {
  return {
    id: nanoid(),
    label,
    value,
  };
};

const priceEntries = ref<PriceEntry[]>([]);
const getPriceComponents = async () => {
  try {
    priceEntries.value = await api.getPriceComponents();
  } catch (error) {
    handleError(error);
  }
};
getPriceComponents();

const total = computed(() => {
  return priceEntries.value.reduce((acc, current) => {
    return acc + Number(current.value);
  }, 0);
});

const onChange = async (id: string, { label, value }: PriceEntryData) => {
  const index = priceEntries.value.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return;
  }

  const oldEntry = priceEntries.value[index];
  const newEntry = { ...oldEntry, label, value };
  priceEntries.value.splice(index, 1, newEntry);

  // TODO: send only what if needed?
  try {
    await api.postPriceComponents(priceEntries.value);
  } catch (error) {
    const index = priceEntries.value.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      priceEntries.value.splice(index, 1, oldEntry);
    }
    handleError(error);
  }
};

const onChangeNew = async ({ label, value }: PriceEntryData) => {
  const priceEntry = createPriceEntry({ label, value });
  priceEntries.value.push(priceEntry);

  try {
    await api.putPriceComponent(priceEntry);
  } catch (error) {
    const index = priceEntries.value.findIndex(
      (entry) => entry.id === priceEntry.id
    );
    if (index !== -1) {
      priceEntries.value.splice(index, 1);
    }
    handleError(error);
  }
};

const onRemove = async (id: string) => {
  const index = priceEntries.value.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    const [deletedEntry] = priceEntries.value.splice(index, 1);

    try {
      await api.deletePriceComponent(deletedEntry);
    } catch (error) {
      // edge case. the list becomes empty while deleting the entity
      if (priceEntries.value[index]) {
        priceEntries.value.splice(index, 0, deletedEntry);
      } else {
        priceEntries.value.push(deletedEntry);
      }
      handleError(error);
    }
  }
};

const onDragEnd = async (event: Sortable.SortableEvent) => {
  const { oldIndex, newIndex } = event;
  if (oldIndex === undefined || newIndex === undefined) {
    return;
  }
  const snapshot = priceEntries.value.slice();
  const [priceEntry] = priceEntries.value.splice(oldIndex, 1);
  priceEntries.value.splice(newIndex, 0, priceEntry);

  try {
    await api.postPriceComponents(priceEntries.value);
  } catch (error) {
    priceEntries.value = snapshot;
    handleError(error);
  }
};
</script>

<template>
  <fieldset v-if="priceEntries.length">
    <legend>Price components</legend>
    <p class="total">Total: {{ total }} EUR/kg</p>
    <hr />
    <SortableComponent
      :list="priceEntries"
      item-key="id"
      :options="{ handle: '.drag-handle' }"
      class="list"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <ExistingPriceField
          :label="element.label"
          :value="element.value"
          :key="element.id"
          :readonly="element.id === 'baseline'"
          @change="onChange(element.id, $event)"
          @remove="onRemove(element.id)"
        />
      </template>
    </SortableComponent>
    <hr />
    <div>
      <NewPriceField @change="onChangeNew" />
    </div>
  </fieldset>
  <div v-else>Loading...</div>
</template>

<style scoped>
li {
  padding: 1rem;
  border: 1px solid transparent;
}

.total {
  text-align: right;
  font-weight: 700;
}

.list {
  display: grid;
  gap: 0.5rem;
}
</style>
