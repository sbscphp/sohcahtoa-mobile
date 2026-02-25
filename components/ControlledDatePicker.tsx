import React from 'react';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import DatePickerField from './DatePickerField';

type DatePickerFieldProps = React.ComponentProps<typeof DatePickerField>;

interface ControlledDatePickerProps<TFieldValues extends FieldValues> extends Omit<DatePickerFieldProps, 'value' | 'onDateChange' | 'error'> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    rules?: Omit<RegisterOptions<TFieldValues, Path<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
}

const ControlledDatePicker = <TFieldValues extends FieldValues>({
    name,
    control,
    rules,
    ...datePickerProps
}: ControlledDatePickerProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <DatePickerField
                    {...datePickerProps}
                    value={value as string}
                    onDateChange={onChange}
                    error={error?.message}
                />
            )}
        />
    );
};

export default ControlledDatePicker;
