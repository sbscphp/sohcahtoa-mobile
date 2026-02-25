import React from 'react';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import InputField from './InputField';

type InputFieldProps = React.ComponentProps<typeof InputField>;

interface ControlledInputProps<TFieldValues extends FieldValues> extends Omit<InputFieldProps, 'value' | 'onChangeText' | 'error'> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    rules?: Omit<RegisterOptions<TFieldValues, Path<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
}

const ControlledInput = <TFieldValues extends FieldValues>({
    name,
    control,
    rules,
    ...inputProps
}: ControlledInputProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <InputField
                    {...inputProps}
                    value={value as string}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error?.message}
                />
            )}
        />
    );
};

export default ControlledInput;
