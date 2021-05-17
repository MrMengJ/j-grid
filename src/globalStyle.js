import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    overflow: hidden;
  }

  #root {
    height: 100%;
    overflow-x: auto;
    background-color: #f7f7f7;
  }
  
  *:focus {
   outline: none !important;
  }

  .bp3-dark .bp3-button:not([class*="bp3-intent-"]) .bp3-icon, .bp3-dark .bp3-button:not([class*="bp3-intent-"]) .bp3-icon-standard, .bp3-dark .bp3-button:not([class*="bp3-intent-"]) .bp3-icon-large {
    color: #fff;
  }
  .bp3-button {
    outline: none;
  }
  .bp3-input {
    border-radius: 6px !important;
    border: 1px solid #d9d9d9;
    box-shadow: none;
  }
  .bp3-input[readonly] {
    box-shadow: none;
  }  
  .bp3-input:disabled,
  .bp3-input.bp3-disabled {
    box-shadow: none;
    background: #f7f7f7 !important;
    color: #182026;
    cursor: not-allowed;
  }
  
  .bp3-control.bp3-switch.bp3-align-right .bp3-control-indicator {
    outline: none!important;
  }
  .bp3-control .bp3-control-indicator{
    outline: none!important;
  }
  iframe {
    border-width: 0;
  }
  
  // blueprint popover
 .bp3-popover {
     box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1) !important;
 }
 
 .bp3-dialog-body .bp3-popover-wrapper {
    display: inline-flex !important;
    align-items: center;
 }
 
 // blueprint file input
 .bp3-file-input input:disabled + .bp3-file-upload-input, .bp3-file-input input.bp3-disabled + .bp3-file-upload-input {
    background: #f7f7f7 !important;
 }
 
`;
