/**
`pmp-simple-date-input`


@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { PaperInputBehavior } from '@polymer/paper-input/paper-input-behavior.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/paper-input/paper-input-error.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import moment from 'moment';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
      input {
        position: relative; /* to make a stacking context */
        outline: none;
        box-shadow: none;
        margin: 0;
        padding: 0;
        width: 100%;
        max-width: 100%;
        background: transparent;
        border: none;
        color: var(--paper-input-container-input-color, var(--primary-text-color));
        -webkit-appearance: none;
        text-align: inherit;
        vertical-align: bottom;

        /* Firefox sets a min-width on the input, which can cause layout issues */
        min-width: 0;

        @apply --paper-font-subhead;
        @apply --paper-input-container-input;
      }

      input:disabled {
        @apply --paper-input-container-input-disabled;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        @apply --paper-input-container-input-webkit-spinner;
      }

      input::-webkit-clear-button {
        @apply --paper-input-container-input-webkit-clear;
      }

      input::-webkit-calendar-picker-indicator {
        @apply --paper-input-container-input-webkit-calendar-picker-indicator;
      }

      input::-webkit-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input:-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input::-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input::-ms-clear {
        @apply --paper-input-container-ms-clear;
      }

      input::-ms-reveal {
        @apply --paper-input-container-ms-reveal;
      }

      input:-ms-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }
    </style>

    <paper-input-container id="container" disabled\$="[[disabled]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]" invalid="[[invalid]]">

    <label hidden\$="[[!label]]" slot="label">[[label]]</label>

    <iron-input bind-value="{{value}}" slot="input" id="input" maxlength\$="[[maxlength]]" allowed-pattern="[0-9\\/]" invalid="{{invalid}}">
      <input aria-labelledby\$="[[_ariaLabelledBy]]" aria-describedby\$="[[_ariaDescribedBy]]" disabled\$="[[disabled]]" bind-value="{{value}}" required\$="[[required]]" maxlength\$="[[maxlength]]" name\$="[[name]]" prevent-invalid-input="" autofocus\$="[[autofocus]]" inputmode\$="[[inputmode]]" placeholder\$="[[placeholder]]">
    </iron-input>

    <template is="dom-if" if="[[errorMessage]]">
      <paper-input-error id="error" slot="error">[[errorMessage]]</paper-input-error>
    </template>

    </paper-input-container>
`,

  // jshint ignore:line
  is: 'pmp-simple-date-input',

  behaviors: [
      PaperInputBehavior,
      IronFormElementBehavior
  ],

  properties: {
      label: {
          type: String,
          value: 'Date of Birth'
      },
      value: {
          type: String,
          notify: true,
          observer: '_onValueChanged'
      },
      invalid: {
          type: Boolean,
          value: false,
          notify: true
      },
      autoValidate: {
          type: Boolean,
          value: false,
          notify: true
      },
      required: {
          type: Boolean,
          value: false,
          notify: true
      },
      disabled: {
          type: Boolean,
          value: false
      },
      datePattern: {
          type: String,
          value: 'MM/DD/YYYY',
          observer: '_patternChanged'
      },
      placeholder: {
          type: String,
          value: 'MM/DD/YYYY'
      },
      maxlength: {
          type: Number,
          value: 10
      }
  },

  observers: [
      '_onFocusedChanged(focused)'
  ],

  ready: function() {
      if (this.value)
          this._handleAutoValidate();
  },

  _onValueChanged: function(value, oldValue) {
      if (typeof oldValue === 'undefined' || value === oldValue)
          return;
      value = value ? value.toString() : '';
      let start = this.$.input.inputElement.selectionStart;
      let initialSlashesBeforeCaret = value.substr(0, start).split('/').length - 1;
      value = value.replace(/\//g, '');
      let shouldFormat = value.length <= this.datePattern.replace(/\//g, '').length;
      let formattedValue = '';
      let currentSlashIndex = 0;
      let totalSlashesAdded = 0;
      for (let i = 0; i < value.length; i++) {
          currentSlashIndex = this.datePattern.indexOf('/', currentSlashIndex);
          if (shouldFormat && i == (currentSlashIndex - totalSlashesAdded)) { // jshint ignore:line
              formattedValue += '/';
              currentSlashIndex++;
              totalSlashesAdded++;
          }
          formattedValue += value[i];
      }
      let updatedSlashesBeforeCaret = formattedValue.substr(0, start).split('/').length - 1;
      let slashesDifference = updatedSlashesBeforeCaret - initialSlashesBeforeCaret;
      this.updateValueAndPreserveCaret(formattedValue.trim());
      this.$.input.inputElement.selectionStart = this.$.input.inputElement.selectionEnd = start + slashesDifference;
      this._handleAutoValidate();
  },

  _onFocusedChanged: function(focused) {
      if (!focused) {
          this._handleAutoValidate();
      }
  },

  validate: function() {
      var valid = this.$.input.validate();
      if (this.value && this.value.length === 10) {
          this.invalid = !(moment(this.value, this.datePattern, true).isValid()); // jshint ignore:line
          this.$.container.invalid = this.invalid;
          this.set('invalid', this.invalid);
      } else {
          this.$.container.invalid = !valid;
      }

      this.$.container.updateAddons({
          inputElement: this.$.input,
          value: this.value,
          invalid: !valid
      });
      return valid;
  },

  _patternChanged: function() {
      var regex = '';
      regex = this.datePattern.replace(/\s/g, '\\s');
      regex = regex.replace(/M/gi, '\d');
      regex = regex.replace(/D/gi, '\\d');
      regex = regex.replace(/Y/gi, '\\d');
      regex = regex.replace(/\+/g, '\\+');
      this.$.input.pattern = regex;
  }
});
