import React from "react";
import AsyncSelect from 'react-select/async';

export default ({value, data, set, multipleOptions, ...props}) => {
  const filter = input => {
    return data.filter(i =>
      i.label.toLowerCase().includes(input.toLowerCase())
    );
  };

  const loadOptions = (input, callback) => {
    setTimeout(() => {
      callback(filter(input));
    }, 200);
  };

  return (
    <AsyncSelect
      {...props}
      value={multipleOptions ? value : value ? {
        label: data.find(a => a.value === value).label,
        value
      } : null}
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      onChange={multipleOptions ? input => set((input !== null && input.length) ? input : []) : input => set(input ? input.value : '')}
    />
  );

}
