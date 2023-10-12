import { JSX, createEffect, createMemo } from 'solid-js';

import { createInputMask } from '@solid-primitives/input-mask';

import {
  extendPropsFrom,
  makeComponent,
  mergeCallbacks
} from '@terraprisma/utils';

import {
  InputContainer,
  FieldInternalWrapper,
  MaskedFieldPropsKeys,
  MaskedFieldProps,
  FieldName,
  useField,
  setupFieldComponent
} from '../utils';
import { FormValue } from '../../types';

import './TextArea.scss';
import { Accents, addAccentColoring } from '@terraprisma/theming';

export type TextAreaChangeEvent = Event & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

export interface TextAreaProps<
  OwnerFormValue extends FormValue = FormValue,
  Name extends FieldName<OwnerFormValue, string> = FieldName<
    OwnerFormValue,
    string
  >
> extends MaskedFieldProps<OwnerFormValue, string, Name> {
  label?: JSX.Element;

  /**
   * @default true
   */
  resizable?: boolean;
  /**
   * @default 'both' or 'none' if {@link resizable} is false
   */
  reisizingDrection?: JSX.CSSProperties['resize'];

  onChange?: (newValue: string, event?: TextAreaChangeEvent) => any;
}

const TextArea = setupFieldComponent<string>().with(
  makeComponent(
    [
      addAccentColoring<TextAreaProps>(),
      extendPropsFrom<TextAreaProps & { color?: Accents }, 'textarea'>([
        ...MaskedFieldPropsKeys,
        'label',
        'color',
        'resizable',
        'reisizingDrection',
        'onChange'
      ])
    ],
    (props, color, elProps) => {
      const {
        elementId: id,

        disabledS: [disabled],
        valueS: [value, setValue],

        focusedS: [_focused, setFocused],
        validate
      } = useField<string>()!;

      let textarea: HTMLTextAreaElement;

      const resizingDirection = createMemo(() =>
        props.resizable ?? true ? props.reisizingDrection ?? 'both' : 'none'
      );

      return (
        <FieldInternalWrapper>
          <InputContainer
            class="textarea-container"
            style={{
              '--resize-direction': resizingDirection()
            }}
            labelFor={id()}
            color={color()}
            label={props.label}
          >
            <textarea
              {...elProps}
              ref={(t) => (textarea = t)}
              id={id()}
              value={(value() || '').toString()}
              disabled={disabled()}
              class={elProps.class}
              classList={{
                'no-label': typeof props.label === 'undefined',
                ...elProps.classList
              }}
              onInput={mergeCallbacks(
                elProps.onInput,
                props.mask ? createInputMask(props.mask) : undefined
              )}
              onFocus={mergeCallbacks(elProps.onFocus, () => setFocused(true))}
              onBlur={mergeCallbacks(elProps.onBlur, () => {
                validate(value());
                setFocused(false);
              })}
            />
          </InputContainer>
        </FieldInternalWrapper>
      );
    }
  )
);

export default TextArea;
