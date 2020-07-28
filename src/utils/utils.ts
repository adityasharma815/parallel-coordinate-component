
export function format(first: string, middle: string, last: string): string {
  return (
    (first || '') +
    (middle ? ` ${middle}` : '') +
    (last ? ` ${last}` : '')
  );
}
export const selectedDataset = {
  id: "influxdb17Feb_2020_withoutJobLoad",
  name: "HPC data - 17 Feb 2020 (with job data)",
  url: "./data/influxdb17Feb_2020_withoutJobLoad.json",
  description: "",
  category: 'hpcc',
  date: "17 Feb 2020",
  group: "sample",
  formatType: 'json'
};

export const panelsInfo = {
  'parallel-coordinates': [
    "Time Range and Source Selection",
    "CPUMem Metrices",
    "CPU Sensor",
    "CPUs",
    "Interval Application",
  ]
}
