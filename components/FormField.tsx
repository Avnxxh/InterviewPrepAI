"use client";
import React from 'react'
import {FormControl, FormDescription, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Controller, FieldValues, Path, Control} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'file' | 'number'
}

const FormField = <T extends FieldValues>({ control, name, label, placeholder, type ="text" }: FormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({ field }) => {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (type === 'number') {
                    const val = e.target.value;
                    field.onChange(val === '' ? undefined : Number(val));
                } else {
                    field.onChange(e);
                }
            };

            return (
                <FormItem>
                    <FormLabel className="label">{label}</FormLabel>
                    <FormControl>
                        <Input
                            className="input"
                            placeholder={placeholder}
                            type={type}
                            {...field}
                            value={field.value ?? (type === 'number' ? '' : undefined)}
                            onChange={handleChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )
        }}
    />
);

export default FormField
