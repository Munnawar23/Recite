import React, { forwardRef } from "react";
import { TextInput as RNTextInput, type TextInputProps } from "react-native";

export interface AppTextInputProps extends TextInputProps {}

export const AppTextInput = forwardRef<RNTextInput, AppTextInputProps>(
  function AppTextInput({ style, maxFontSizeMultiplier = 1.2, ...rest }, ref) {
    return (
      <RNTextInput
        ref={ref}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={style}
        {...rest}
      />
    );
  },
);

export type AppTextInputRef = RNTextInput;
export default AppTextInput;
