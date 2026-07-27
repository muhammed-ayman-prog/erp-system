export default function getChangedFields(
  before,
  after
) {

  if (!before || !after)
    return [];

  const ignoredFields = [
    "updatedAt",
    "createdAt"
  ];

  const changes = [];

  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after)
  ]);

  keys.forEach(key => {

    if (
      ignoredFields.includes(key)
    ) {
      return;
    }

    const beforeValue =
      before[key];

    const afterValue =
      after[key];

    if (
      JSON.stringify(beforeValue) !==
      JSON.stringify(afterValue)
    ) {

      changes.push({
        field: key,
        before: beforeValue,
        after: afterValue
      });

    }

  });

  return changes;

}