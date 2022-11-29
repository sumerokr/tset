import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ExistingPriceField, {
  validate,
  transform,
  format,
} from "./ExistingPriceField.vue";

describe("NewInput", () => {
  it.each([
    ["", "", false],

    ["", 1, false],
    ["", 100, false],

    ["", "", false],
    [" ", "", false],
    [" a", "", true],

    ["a", 0, true],
    ["text", 100, true],
  ] as const)("validate(%s, %s) -> %s", (label, value, expected) => {
    expect(validate({ label, value })).toBe(expected);
  });

  it.each([
    [" a", "", { label: "a", value: 0 }],
    ["a", 0, { label: "a", value: 0 }],
    ["text", 100, { label: "text", value: 100 }],
  ] as const)("transform(%s, %s) -> %s", (label, value, expected) => {
    expect(transform({ label, value })).toEqual(expected);
  });

  it.each([
    ["", "", undefined],

    ["", 1, undefined],
    ["", 100, undefined],

    ["", "", undefined],
    [" ", "", undefined],

    [" a", "", { label: "a", value: 0 }],
    ["a", 0, { label: "a", value: 0 }],
    ["text", 100, { label: "text", value: 100 }],
  ] as const)("emits properly for (%s, %s)", async (label, value, expected) => {
    const wrapper = mount(ExistingPriceField, {
      props: {
        label: "label",
        value: 1,
      },
    });

    const labelSwitcher = wrapper.find("[data-testid='label-switcher']");
    const existingValue = wrapper.find("[data-testid='existing-value']");

    await labelSwitcher.trigger("click");
    const existingLabel = wrapper.find("[data-testid='existing-label']");

    await existingLabel.setValue(label);
    console.log("value is", value);

    await existingValue.setValue(value);

    await existingLabel.trigger("blur");
    await existingValue.trigger("blur");

    expect(wrapper.emitted("change")?.[0][0]).toEqual(expected);
  });

  it.each([
    [1.2345, "1.23"],
    [1.2456, "1.25"],
    [1.204, "1.20"],
    [4.3, "4.3"],
    [1.3, "1.3"],
    [1, "1.0"],
    [0, "0.0"],
  ] as const)("format(%s, %s) -> %s", (value, expected) => {
    expect(format(value)).toBe(expected);
  });
});
