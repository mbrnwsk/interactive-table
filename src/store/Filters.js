import { types, getType, getParent, getRoot } from "mobx-state-tree";
import { isEmpty, uniq } from "lodash";
import { FILTER_TYPES } from "../settings";

/* base properties and methods for all filters */
export const createModelFromBase = comparator =>
  types
    .model({
      isVisible: false
    })
    .views(self => ({
      get type() {
        return getType(self).name;
      },
      get columnKey() {
        return getParent(self).key;
      },
      compare: record => comparator(record, self)
    }))
    .actions(self => ({
      toggleVisibility: () => (self.isVisible = !self.isVisible)
    }));

export const StringFilter = createModelFromBase(
  (record, { columnKey, value }) =>
    record[columnKey].toUpperCase().startsWith(value.toUpperCase())
)
  .named(FILTER_TYPES.STRING_FILTER)
  .props({
    value: ""
  })
  .actions(self => ({
    setValue: value => (self.value = value)
  }));

export const MultiSelectFilter = createModelFromBase(
  (record, { columnKey, selectedValues, isSelected }) =>
    selectedValues.length > 0 ? isSelected(record[columnKey]) : true
)
  .named(FILTER_TYPES.MULTI_SELECT_FILTER)
  .props({
    selectedValues: types.optional(types.array(types.string), [])
  })
  .views(self => ({
    get uniqueColumnValues() {
      const { records } = getRoot(self);

      return uniq(records.map(record => record[self.columnKey]));
    },
    isSelected: value => self.selectedValues.includes(value)
  }))
  .actions(self => ({
    toggleValue: value =>
      self.selectedValues.includes(value)
        ? self.selectedValues.remove(value)
        : self.selectedValues.push(value)
  }));

export const RangeFilter = createModelFromBase(
  (record, { columnKey, selectedRange: [min, max] }) =>
    record[columnKey] >= min && record[columnKey] <= max
)
  .named(FILTER_TYPES.RANGE_FILTER)
  .props({
    selectedRange: types.optional(types.array(types.number), [])
  })
  .views(self => ({
    get columnMinMaxRange() {
      const { records } = getRoot(self);
      const values = records.map(record => record[self.columnKey]);

      return [Math.min(...values), Math.max(...values)];
    }
  }))
  .actions(self => ({
    setSelectedRange: range => (self.selectedRange = range),
    afterAttach: () => {
      if (isEmpty(self.selectedRange)) {
        self.setSelectedRange(self.columnMinMaxRange);
      }
    }
  }));
