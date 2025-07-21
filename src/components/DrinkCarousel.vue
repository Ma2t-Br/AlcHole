<template>
  <div class="relative w-full flex flex-col items-center">
    <!-- Flèche gauche -->
    <button
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 rounded-full p-2 shadow-lg transition disabled:opacity-30"
      @click="prev"
      :disabled="selectedIndex === 0"
      aria-label="Précédent"
    >
      <span class="text-2xl">◀</span>
    </button>

    <!-- Carrousel -->
    <div class="flex items-center justify-center w-full overflow-hidden" style="min-height: 220px;">
      <div class="relative flex items-center w-full justify-center">
        <div
          v-for="(drink, i) in drinkTemplates"
          :key="drink.id"
          @click="handleClick(i)"
          class="coverflow-item cursor-pointer transition-all duration-500"
          :class="coverflowClass(i)"
          :style="coverflowStyle(i)"
        >
          <div class="text-center select-none">
            <div class="text-5xl mb-3">{{ drink.emoji }}</div>
            <h3 class="text-white font-semibold text-base mb-2">{{ drink.name }}</h3>
            <div class="text-white/80 text-xs">
              <div>{{ drink.volume }}ml</div>
              <div>{{ drink.alcoholPercentage }}°</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flèche droite -->
    <button
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 rounded-full p-2 shadow-lg transition disabled:opacity-30"
      @click="next"
      :disabled="selectedIndex === drinkTemplates.length - 1"
      aria-label="Suivant"
    >
      <span class="text-2xl">▶</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DrinkTemplate } from '../types'

const emit = defineEmits<{
  select: [drink: DrinkTemplate]
}>()

const drinkTemplates = ref<DrinkTemplate[]>([
  {
    id: 'beer-guinness',
    name: 'Guinness',
    emoji: '🍺',
    volume: 500,
    alcoholPercentage: 4.2
  },
  {
    id: 'beer-heineken',
    name: 'Heineken',
    emoji: '🍻',
    volume: 330,
    alcoholPercentage: 5.0
  },
  {
    id: 'wine-red',
    name: 'Vin Rouge',
    emoji: '🍷',
    volume: 150,
    alcoholPercentage: 12.5
  },
  {
    id: 'wine-white',
    name: 'Vin Blanc',
    emoji: '🥂',
    volume: 150,
    alcoholPercentage: 11.5
  },
  {
    id: 'vodka',
    name: 'Vodka',
    emoji: '🍸',
    volume: 40,
    alcoholPercentage: 40.0
  },
  {
    id: 'whiskey',
    name: 'Whiskey',
    emoji: '🥃',
    volume: 40,
    alcoholPercentage: 40.0
  },
  {
    id: 'champagne',
    name: 'Champagne',
    emoji: '🍾',
    volume: 150,
    alcoholPercentage: 12.0
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    emoji: '��',
    volume: 200,
    alcoholPercentage: 15.0
  }
])

const selectedIndex = ref(0)

const selectIndex = (i: number) => {
  selectedIndex.value = i
}

const handleClick = (i: number) => {
  if (i === selectedIndex.value) {
    emit('select', drinkTemplates.value[i])
  } else {
    selectIndex(i)
  }
}

const prev = () => {
  if (selectedIndex.value > 0) {
    selectIndex(selectedIndex.value - 1)
  }
}
const next = () => {
  if (selectedIndex.value < drinkTemplates.value.length - 1) {
    selectIndex(selectedIndex.value + 1)
  }
}

// Pour le style coverflow
const coverflowClass = (i: number) => {
  if (i === selectedIndex.value) return 'z-20 coverflow-center shadow-2xl scale-110 bg-white/40 border-yellow-400';
  if (i === selectedIndex.value - 1 || i === selectedIndex.value + 1) return 'z-10 coverflow-side scale-95 opacity-80';
  return 'z-0 coverflow-far scale-90 opacity-50 pointer-events-none';
}
const coverflowStyle = (i: number) => {
  const offset = i - selectedIndex.value;
  return {
    transform: `translateX(${offset * 120}px) scale(${i === selectedIndex.value ? 1.1 : 0.95}) rotateY(${offset * 20}deg)`
  }
}

// Sélection initiale (optionnel)
watch(drinkTemplates, () => {
  if (drinkTemplates.value.length > 0 && selectedIndex.value === 0) {
    emit('select', drinkTemplates.value[0])
  }
}, { immediate: true })
</script>

<style scoped>
.coverflow-item {
  position: absolute;
  top: 0;
  left: 50%;
  width: 180px;
  min-height: 200px;
  margin-left: -90px;
  background: rgba(255,255,255,0.15);
  border-radius: 1.5rem;
  border: 2px solid rgba(255,255,255,0.2);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
  transition: all 0.5s cubic-bezier(.4,2,.6,1);
  cursor: pointer;
  user-select: none;
}
.coverflow-center {
  border: 2px solid #facc15;
  background: rgba(255,255,255,0.35);
  filter: brightness(1.1) drop-shadow(0 0 8px #facc15cc);
}
.coverflow-side {
  filter: blur(0.5px) brightness(0.95);
}
.coverflow-far {
  filter: blur(1.5px) brightness(0.8);
}
</style>