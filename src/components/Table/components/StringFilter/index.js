import React from "react";
import { Input } from "reactstrap";

const StringFilter = ({ filter }) => (
  <Input
    value={filter.value}
    onChange={({ target }) => filter.setValue(target.value)}
    placeholder="Type to filter"
  />
);

export default StringFilter;
