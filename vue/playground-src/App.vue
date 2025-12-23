<template>
  <zoompinch
    ref="zoompinchRef"
    style="width: 800px; height: 600px; border: 1px solid #f00;"
    v-model:transform="transform"
    @init="handleInit"
    :zoom-speed="1"
    :translate-speed="1"
    :zoom-speed-apple-trackpad="1"
    :translate-speed-apple-trackpad="1"
  >
    <img width="1536" height="2048" src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public" />
    
    <template #matrix="{ composePoint, canvasWidth, canvasHeight }">
      <svg width="100%" height="100%">
        <circle 
          :cx="composePoint(canvasWidth / 2, canvasHeight / 2)[0]"
          :cy="composePoint(canvasWidth / 2, canvasHeight / 2)[1]"
          r="8"
          fill="red"
        />
      </svg>
    </template>
  </zoompinch>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Zoompinch from '../src/components/Zoompinch.vue';

const zoompinchRef = ref<InstanceType<typeof Zoompinch>>();
const transform = ref({
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotate: 0
});

function handleInit() {
  zoompinchRef.value?.applyTransform(1, [0.5, 0.5], [0.5, 0.5]);
}
</script>