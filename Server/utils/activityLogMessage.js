export const buildCreateDescription = (entity, targetName) => {
  return `Created ${entity} ${targetName}`;
};

export const buildUpdateDescription = (entity, changes, options = {}) => {
  const target = options.target ? ` ${options.target}` : "";
  const changeText = changes
    .map((change) => `${change.field}: ${change.before ?? "-"} -> ${change.after ?? "-"}`)
    .join("; ");

  return `Updated ${entity}${target}: ${changeText}`;
};

export const buildDeleteDescription = (entity, targetName) => {
  return `Deleted ${entity} ${targetName}`;
};

export const buildActivateDescription = (entity, targetName) => {
  return `Activated ${entity} ${targetName}`;
};

export const buildDeactivateDescription = (entity, targetName) => {
  return `Deactivated ${entity} ${targetName}`;
};

export const buildAssignDescription = (subject, value, object, target) => {
  return `Assigned ${subject} ${value} to ${object} ${target}`;
};

export const buildRemoveDescription = (subject, value, object, target) => {
  return `Removed ${subject} ${value} from ${object} ${target}`;
};