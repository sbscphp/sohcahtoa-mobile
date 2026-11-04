import React from 'react';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import InputField, { InputFieldProps } from './InputField';

export interface ControlledInputProps<TFieldValues extends FieldValues = any>
    extends Omit<InputFieldProps, 'value' | 'onChangeText' | 'error'> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    rules?: Omit<RegisterOptions<TFieldValues, Path<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    filterType?: 'numeric' | 'alphanumeric' | 'none';
}

const ControlledInput = <TFieldValues extends FieldValues = any>({
    name,
    control,
    rules,
    filterType = 'none',
    ...inputProps
}: ControlledInputProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }: any) => {
                const handleChangeText = (text: string) => {
                    let filteredText = text;
                    if (filterType === 'numeric') {
                        filteredText = text.replace(/[^0-9]/g, '');
                    } else if (filterType === 'alphanumeric') {
                        filteredText = text.replace(/[^a-zA-Z0-9]/g, '');
                    }
                    onChange(filteredText);
                };

                return (
                    <InputField
                        {...inputProps}
                        value={(value as string) ?? ''}
                        onChangeText={handleChangeText}
                        onBlur={onBlur}
                        error={error?.message}
                    />
                );
            }}
        />
    );
};

export default ControlledInput;
