import {
  Component,
  createMemo,
  children as accessChildren,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  For,
  createEffect,
  ParentProps,
  on,
  splitProps,
} from 'solid-js';

import InputContainer from '../_Shared/InputContainer/InputContainer';
import FieldInternalWrapper from '../_Shared/FieldInternalWrapper/FieldInternalWrapper';
import { KeyboardArrowDown } from '../../../Icons';

import { FieldPropKeys, FieldProps, setupField } from '../_Shared/Utilts';

import { FieldValue } from '../../FormContext';

import './Select.scss';
import { Dropdown } from '../../../General';
import { dbg, mergeClass } from '../../../_Shared/Utils';

export interface SelectProps extends FieldProps, JSX.HTMLAttributes<HTMLDivElement> {
  label?: JSX.Element;
  helperText?: JSX.Element;

  color?: 'primary' | 'secondary' | 'tertiary';

  onChange?: (newValue: FieldValue) => any;
  onFocused?: () => any;
}

export interface OptionProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value: FieldValue;
  children: JSX.Element;
};

const Option: Component<OptionProps> = (props) => {
  return props as unknown as JSX.Element;
};

/**
 * @description The component to be able to select only one option among many such as choosing a state/county,
 * a payment type or any other thing you wish. 
 *
 * The values of the options can be written using the `Select.Option` component which just returns the
 * props of the Option instead of rendering it. The `Select` is the one that renders it. All other children
 * of the Select *will be ignored*.
 *
 * @example 
 * ```tsx
 * <Select 
 *   name='bestGame' 
 *   label='Which one is better?' 
 *   helperText='OBS: choose Terraria :)'
 *   validators={[Validators.required]}
 * >
 *   <Select.Option value='minecraft'>Minecraft</Select.Option>
 *   <Select.Option value='terraria'>Terraria</Select.Option>
 *   <Select.Option value='starbound'>Starbound</Select.Option>
 *   <Select.Option value='stardew-valley'>Stardew Valley</Select.Option>
 * </Select>
 * ```
 */
const Select = (allProps: SelectProps) => {
  const [props, elProps] = splitProps(
    allProps, 
    [...FieldPropKeys, 'label', 'helperText', 'color', 'onChange', 'onFocused']
  );

  const {
    elementId: id,
    errorsStore: [errors, _setErrors],
    disabledSignal: [disabled, _setDisabled],
    focusedSignal: [focused, setFocused],
    valueSignal: [value, setValue],
    validate,
    hasContent,
  } = setupField(props);

  const [inputContainerRef, setInputContainerRef] = createSignal<HTMLDivElement>();

  const onDocumentClick = (event: MouseEvent) => {
    if (event.target !== inputContainerRef() && focused()) {
      setFocused(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', onDocumentClick);
  });

  onCleanup(() => {
    document.removeEventListener('click', onDocumentClick);
  });

  const getChildren = accessChildren(() => elProps.children);
  const options = createMemo<OptionProps[]>(() => {
    let childrenArr: (JSX.Element | OptionProps)[];

    const children = getChildren();
    if (Array.isArray(children)) {
      childrenArr = children;
    } else {
      childrenArr = [children];
    }

    return childrenArr.filter(child => {
      return child !== null
        && typeof child === 'object'
        && Object.hasOwn(child, 'value')
        && Object.hasOwn(child, 'children');
    }) as OptionProps[];
  });

  const optionLabelFromValue = (value: FieldValue | undefined) => {
    return options().find(opt => opt.value === value)?.children || '';
  };

  createEffect(on(focused, () => {
    if (props.onFocused && focused() === true) {
      props.onFocused();
    }

    if (focused() === false) {
      validate(value());
    }
  }, { defer: true }));

  return <FieldInternalWrapper
    name={props.name}
    errors={errors}
    isDisabled={disabled()}
    style={{
      cursor: disabled() === false ? 'pointer' : 'default'
    }}
    renderHelperText={
      (typeof props.validators !== 'undefined' 
        && props.validators.length !== 0) 
      || typeof props.helperText !== 'undefined'
    }
    helperText={props.helperText}
  >
    <InputContainer
      {...elProps}
      id={id()}
      label={props.label}
      focused={focused()}
      color={props.color}
      disabled={disabled()}
      onClick={(e) => {
        if (typeof elProps.onClick === 'function') {
          elProps.onClick(e);
        }

        if (!disabled()) {
          setFocused(focused => !focused)
        }
      }}
      icon={
        <KeyboardArrowDown
          variant='rounded'
          class='select-icon'
          classList={{
            'open': focused()
          }}
        />
      }
      hasContent={hasContent()}
      ref={(ref) => {
        if (typeof elProps.ref === 'function') {
          elProps.ref(ref);
        }

        setInputContainerRef(ref);
      }}
    >
      {optionLabelFromValue(value())}
    </InputContainer>

    <Dropdown
      for={inputContainerRef()!}
      class='select-dropdown'
      visible={focused()}
      classList={{
        'primary': props.color === 'primary' || typeof props.color === 'undefined',
        'secondary': props.color === 'secondary',
        'tertiary': props.color === 'tertiary'
      }}
    >
      <For each={options()}>{(optionAllProps) => {
        const [optionProps, optionElProps] = splitProps(optionAllProps, ['value']);
        return <div
          {...optionElProps}
          class={mergeClass('option', optionElProps.class)}
          classList={{ 
            active: optionProps.value === value(),
            ...optionElProps.classList
          }}
          onClick={e => {
            if (props.onChange) {
              props.onChange(optionProps.value);
            }
            
            if (typeof optionElProps.onClick === 'function') {
              optionElProps.onClick(e);
            }

            setValue(optionProps.value);
            setFocused(false);
          }}
        >
          {optionElProps.children}
        </div>
      }}</For>
    </Dropdown>
  </FieldInternalWrapper>;
};

Select.Option = Option;

export default Select;
