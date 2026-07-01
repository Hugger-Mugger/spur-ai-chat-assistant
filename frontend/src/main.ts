import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const targetElement = document.getElementById('app');

if (!targetElement) {
  throw new Error("Could not find element with id 'app'");
}

const app = mount(App, {
  target: targetElement,
});

export default app;