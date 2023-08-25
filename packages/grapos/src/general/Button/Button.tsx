import { Component, ComponentProps, createMemo, JSX } from 'solid-js';

import { useDepth } from '../Box/Box';

import { createComponentExtendingFromOther, mergeClass } from '../../utils';

import Ripple from '../Ripple/Ripple';

import './Button.scss';

export interface ButtonProps {
  color?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  size?: 'small' | 'medium' | 'large';

  disabled?: boolean;

  rippleColor?: string;
  rippleClass?: string;
  centerRipple?: boolean;

  style?: JSX.CSSProperties;
}

const Button = createComponentExtendingFromOther<ButtonProps, 'button'>(
  (props, elProps) => {
    const depth = useDepth() || (() => 0);

    const color = createMemo(() => props.color || 'primary');
    const rippleColor = createMemo(
      () =>
        props.rippleColor ||
        (color() === 'transparent' ? 'var(--text-0)' : `var(--text-${color()})`)
    );

    return (
      <Ripple
        noRipple={props.disabled}
        center={props.centerRipple}
        class={props.rippleClass}
        classList={{
          small: props.size === 'small',
          medium: props.size === 'medium' || typeof props.size === 'undefined',
          large: props.size === 'large'
        }}
        color={rippleColor()}
        style={{
          display: 'inline-block',
          'border-radius': props.style?.['border-radius']
        }}
      >
        <button
          type="button"
          {...elProps}
          class={elProps.class}
          classList={{
            primary: color() === 'primary',
            secondary: color() === 'secondary',
            tertiary: color() === 'tertiary',
            transparent: color() === 'transparent',

            disabled: props.disabled,

            'gray-1': depth() === 0,
            'gray-2': depth() === 1,
            'gray-3': depth() === 2,
            'gray-4': depth() === 3,

            small: props.size === 'small',
            medium:
              props.size === 'medium' || typeof props.size === 'undefined',
            large: props.size === 'large',

            ...elProps.classList
          }}
        >
          {elProps.children}
        </button>
      </Ripple>
    );
  },
  ['color', 'size', 'disabled', 'rippleColor', 'rippleClass', 'centerRipple']
) as {
  (props: ButtonProps & JSX.HTMLAttributes<HTMLButtonElement>): JSX.Element;
  Rounded(props: ComponentProps<typeof Button>): JSX.Element;
  Icon(props: ComponentProps<typeof Button>): JSX.Element;
  Empty(props: ComponentProps<typeof Button>): JSX.Element;
};

const RoundedButton: Component<ComponentProps<typeof Button>> = (props) => {
  return (
    <Button
      rippleClass="rounded"
      color="transparent"
      {...props}
      class={mergeClass('rounded', props.class)}
    >
      {props.children}
    </Button>
  );
};

const EmptyButton: Component<ComponentProps<typeof Button>> = (props) => {
  const color = createMemo(() => props.color || 'primary');

  return (
    <Button
      rippleColor={color() === 'transparent' ? undefined : `var(--${color()})`}
      {...props}
      class={mergeClass('empty', props.class)}
    >
      {props.children}
    </Button>
  );
};

const IconButton: Component<ComponentProps<typeof Button>> = (props) => {
  return (
    <RoundedButton {...props} class={mergeClass('icon', props.class)}>
      {props.children}
    </RoundedButton>
  );
};

Button.Rounded = RoundedButton;
Button.Icon = IconButton;
Button.Empty = EmptyButton;

export default Button;
