<template>
  <div class="root">
    <zoompinch ref="zoompinchRef" v-model:transform="transform" :mouse="false" :wheel="true" :touch="true" :gesture="true" :rotation="true" :min-scale="0.1" :max-scale="10" :clamp-bounds="false" @init="handleInit" @click="handleClick">
        <img width="1536" height="2048" src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public"></img>
        <template #matrix="{ composePoint, normalizeClientCoords, canvasWidth, canvasHeight }">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" :data-w="canvasWidth" :data-h="canvasHeight">
                <circle :cx="composePoint(1536 / 2, 2048 / 2)[0]" :cy="composePoint(1536 / 2, 2048 / 2)[1]" r="5" style="fill: #f00"></circle>
            </svg>
        </template>
    </zoompinch>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Zoompinch from '../src/components/Zoompinch.vue'

const zoompinchRef = ref<InstanceType<typeof Zoompinch>>();

const transform = ref({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0
});

function handleInit() {
  if (!zoompinchRef.value) return;
  //zoompinchRef.value.applyTransform(1, [0.5, 0.5], [0.5, 0.5], 0);

  setTimeout(() => {
    console.log(zoompinchRef.value.canvasWidth / 2, zoompinchRef.value.canvasHeight / 2);
    
    zoompinchRef.value.rotateCanvas(zoompinchRef.value.canvasWidth / 2, zoompinchRef.value.canvasHeight / 2, Math.PI / 4);
  }, 1000);
}

function handleClick(event: MouseEvent) {
  if (!zoompinchRef.value) return;
  const [x, y] = zoompinchRef.value.normalizeClientCoords(event.clientX, event.clientY);
  console.log('clicked at', x, y);
}


</script>

<style scoped lang="css">
.zoompinch {
    width: 800px;
    height: 600px;
    border: 1px solid #ccc;
}

</style>
