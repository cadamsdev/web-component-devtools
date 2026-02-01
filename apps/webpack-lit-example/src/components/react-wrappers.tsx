import { createComponent } from '@lit/react';
import React from 'react';
import { MyButton as MyButtonWC } from './my-button';
import { MyCard as MyCardWC } from './my-card';
import { MyCounter as MyCounterWC } from './my-counter';
import { MyBadge as MyBadgeWC } from './my-badge';

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
