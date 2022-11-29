import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NewPriceField, { validate } from "./NewPriceField.vue";

describe("NewPriceField", () => {
  it.each([
    ["", "", false],

    ["", 1, false],
    ["", 100, false],

    ["", "", false],
    [" ", "", false],
    [" a", "", false],

    ["a", 0, true],
    ["text", 100, true],
  ] as const)("validate(%i, %i) -> %i", (label, value, expected) => {
    expect(validate({ label, value })).toBe(expected);
  });

  it.each([
    ["", "", undefined],

    ["", 1, undefined],
    ["", 100, undefined],

    ["", "", undefined],
    [" ", "", undefined],
    [" a", "", undefined],

    ["a", 0, { label: "a", value: 0 }],
    ["text", 100, { label: "text", value: 100 }],
  ] as const)("emits properly for (%i, %i)", async (label, value, expected) => {
    const wrapper = mount(NewPriceField);

    const newLabel = wrapper.find("[data-testid='new-label']");
    const newValue = wrapper.find("[data-testid='new-value']");

    await newLabel.setValue(label);
    await newValue.setValue(value);

    await newLabel.trigger("blur");
    await newValue.trigger("blur");

    expect(wrapper.emitted("change")?.[0][0]).toEqual(expected);
  });
});
