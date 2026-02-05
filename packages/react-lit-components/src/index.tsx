import { createComponent } from '@lit/react';
import React from 'react';
import { MyButton as MyButtonWC } from 'lit-components';
import { MyCard as MyCardWC } from 'lit-components';
import { MyCounter as MyCounterWC } from 'lit-components';
import { MyBadge as MyBadgeWC } from 'lit-components';
import { MyProductCard as MyProductCardWC } from 'lit-components';
import { MyUserProfile as MyUserProfileWC } from 'lit-components';
import { MyModal as MyModalWC } from 'lit-components';
import { MyTabs as MyTabsWC } from 'lit-components';
import { MyFormField as MyFormFieldWC } from 'lit-components';
import { MyNotification as MyNotificationWC } from 'lit-components';

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

export const MyProductCard = createComponent({
  tagName: 'my-product-card',
  elementClass: MyProductCardWC,
  react: React,
  events: {
    onAddToCart: 'add-to-cart',
    onBuyNow: 'buy-now',
  },
});

export const MyUserProfile = createComponent({
  tagName: 'my-user-profile',
  elementClass: MyUserProfileWC,
  react: React,
  events: {
    onFollow: 'follow',
    onMessage: 'message',
  },
});

export const MyModal = createComponent({
  tagName: 'my-modal',
  elementClass: MyModalWC,
  react: React,
  events: {
    onModalOpen: 'modal-open',
    onModalClose: 'modal-close',
    onModalConfirm: 'modal-confirm',
    onModalCancel: 'modal-cancel',
  },
});

export const MyTabs = createComponent({
  tagName: 'my-tabs',
  elementClass: MyTabsWC,
  react: React,
  events: {
    onTabChange: 'tab-change',
  },
});

export const MyFormField = createComponent({
  tagName: 'my-form-field',
  elementClass: MyFormFieldWC,
  react: React,
  events: {
    onFieldInput: 'field-input',
    onFieldValid: 'field-valid',
  },
});

export const MyNotification = createComponent({
  tagName: 'my-notification',
  elementClass: MyNotificationWC,
  react: React,
  events: {
    onNotificationDismiss: 'notification-dismiss',
    onNotificationAction: 'notification-action',
  },
});
