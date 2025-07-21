<template>
  <div class="carousel-container">
    <!-- Flèche gauche -->
    <button
      class="carousel-arrow left"
      @click="prev"
      :disabled="selectedIndex === 0"
      aria-label="Précédent"
    >
      <span style="font-size: 1.2rem; color: #222;">◀</span>
    </button>
    <!-- Carrousel -->
    <div class="carousel-inner">
      <div class="carousel-items">
        <div
          v-for="(drink, i) in drinkTemplates"
          :key="drink.id"
          @click="handleClick(i)"
          class="coverflow-item cursor-pointer transition-all duration-500"
          :class="coverflowClass(i)"
          :style="coverflowDisplayStyle(i)"
        >
          <div class="text-center select-none">
            <div style="font-size: 2rem; margin-bottom: 0.2rem;">{{ drink.emoji }}</div>
            <h3 style="color: #222; font-size: 0.95rem; font-weight: 500; margin-bottom: 0.1rem;">{{ drink.name }}</h3>
            <div style="color: #444; font-size: 0.7rem;">
              <div>{{ drink.volume }}ml</div>
              <div>{{ drink.alcoholPercentage }}°</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Flèche droite -->
    <button
      class="carousel-arrow right"
      @click="next"
      :disabled="selectedIndex === drinkTemplates.length - 1"
      aria-label="Suivant"
    >
      <span style="font-size: 1.2rem; color: #222;">▶</span>
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

// Ajout de la fonction pour masquer les éléments trop éloignés
const coverflowDisplayStyle = (i: number) => {
  if (Math.abs(i - selectedIndex.value) > 1) {
    return { display: 'none' };
  }
  // Ajustement du décalage horizontal pour un alignement parfait
  const offset = i - selectedIndex.value;
  return {
    transform: `translateX(${offset * 115}px) scale(${i === selectedIndex.value ? 1.1 : 0.95}) rotateY(${offset * 20}deg)`,
    top: '50%',
    marginTop: '-50px', // moitié de la hauteur (100px)
  };
}

// Sélection initiale (optionnel)
watch(drinkTemplates, () => {
  if (drinkTemplates.value.length > 0 && selectedIndex.value === 0) {
    emit('select', drinkTemplates.value[0])
  }
}, { immediate: true })
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 120px;
  margin: 0 auto 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}
.carousel-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel-items {
  position: relative;
  width: 100%;
  height: 100%;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  padding: 0.3rem 0.5rem;
  font-size: 1.2rem;
  box-shadow: none;
  border: none;
  z-index: 2;
}
.carousel-arrow.left {
  left: 0;
}
.carousel-arrow.right {
  right: 0;
}
.coverflow-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110px;
  min-height: 100px;
  margin-left: -55px;
  margin-top: -50px;
  background: rgba(255,255,255,0.15);
  border-radius: 1rem;
  border: 1.5px solid rgba(255,255,255,0.18);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
  transition: all 0.5s cubic-bezier(.4,2,.6,1);
  cursor: pointer;
  user-select: none;
  z-index: 1;
}
.coverflow-center {
  border: 1.5px solid #facc15;
  background: rgba(255,255,255,0.30);
  filter: brightness(1.05) drop-shadow(0 0 4px #facc15cc);
}
.coverflow-side {
  filter: blur(0.3px) brightness(0.95);
}
.coverflow-far {
  filter: blur(1px) brightness(0.8);
}
</style>