import { createComponent } from '@lit/react';
import React from 'react';
import { MyButton as MyButtonWC } from '@web-component-dev-tools/lit-components';
import { MyCard as MyCardWC } from '@web-component-dev-tools/lit-components';
import { MyCounter as MyCounterWC } from '@web-component-dev-tools/lit-components';
import { MyBadge as MyBadgeWC } from '@web-component-dev-tools/lit-components';

// React wrappers for Lit web components
export const MyButton = createComponent({
  tagName: 'my-button',
  elementClass: MyButtonWC,
  react: React,
  events: {
    onButtonClick: 'button-click',
  },
});

export const MyCard = createComponent({
  tagName: 'my-card',
  elementClass: MyCardWC,
  react: React,
});

export const MyCounter = createComponent({
  tagName: 'my-counter',
  elementClass: MyCounterWC,
  react: React,
  events: {
    onCounterChange: 'counter-change',
  },
});

export const MyBadge = createComponent({
  tagName: 'my-badge',
  elementClass: MyBadgeWC,
  react: React,
});
