import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="시작일"
        value={startDate}
        maxDate={endDate}
        onChange={(newValue) => {
          setStartDate(newValue);
          setEndDate(null);
        }}
        slotProps={{
          textField: {
            size: "small",
          },
        }}
      />
      <span> </span>
      <DatePicker
        label="종료일"
        value={endDate}
        minDate={startDate}
        disabled={!startDate}
        onChange={(newValue) => setEndDate(newValue)}
        slotProps={{
          textField: {
            size: "small",
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DateRangePicker;
