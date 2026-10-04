import type { PinProperty } from '../../types/index.ts';

export function chooseOptions(
  selectedIds: number[],
  property: PinProperty,
  optionIds: number[]
): number[] {
  const propertyOptionIds = new Set(
    property.options.map((option) => option.id)
  );

  return [
    ...selectedIds.filter((id) => !propertyOptionIds.has(id)),
    ...optionIds.filter((id) => propertyOptionIds.has(id))
  ];
}

export function offeredOptionIds(
  pinProperties: PinProperty[],
  optionIds: number[]
): number[] {
  const offered = new Set(
    pinProperties.flatMap((property) =>
      property.options.map((option) => option.id)
    )
  );

  return optionIds.filter((id) => offered.has(id));
}
