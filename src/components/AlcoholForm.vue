<template>
  <div class="glass-container" style="padding: 1.2rem 0.5rem; max-width: 100vw; width: 100%; margin: 0; box-shadow: none; border-radius: 20px;">
    <div style="display: flex; flex-direction: column; gap: 1.2rem; align-items: center;">
      <!-- Drink Selection -->
      <div style="width: 100%;">
        <h2 style="font-size: 1.2rem; font-weight: 600; color: #222; text-align: center; margin-bottom: 0.5rem;">🍻 Sélectionne tes boissons</h2>
        <!-- Drink Carousel -->
        <div style="max-width: 340px; margin: 0 auto;">
          <DrinkCarousel @select="addDrink" />
        </div>
        <!-- Selected Drinks -->
        <div v-if="selectedDrinks.length > 0" style="margin-top: 0.8rem;">
          <h3 style="font-size: 1rem; font-weight: 500; color: #444; margin-bottom: 0.3rem;">Boissons sélectionnées :</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <DrinkCard 
              v-for="drink in selectedDrinks" 
              :key="drink.id"
              :drink="drink"
              @update="updateDrink"
              @remove="removeDrink"
            />
          </div>
        </div>
      </div>
      <!-- Weight Input -->
      <div style="width: 100%;">
        <label style="font-size: 1rem; color: #222; font-weight: 500; margin-bottom: 0.2rem; display: block;">⚖️ Ton poids (kg)</label>
        <input
          v-model.number="weight"
          type="number"
          min="30"
          max="200"
          style="width: 100%; padding: 0.5rem 0.8rem; border-radius: 12px; border: 1px solid #e0e0e0; background: rgba(255,255,255,0.7); color: #222; font-size: 1rem; margin-bottom: 0.5rem;"
          placeholder="Ex: 70"
        />
      </div>
      <!-- Submit Button -->
      <button
        @click="submitForm"
        :disabled="!canSubmit"
        style="width: 100%; padding: 0.7rem 0; border-radius: 12px; background: rgba(255,255,255,0.35); color: #222; font-size: 1.1rem; font-weight: 500; box-shadow: none; border: none; margin-top: 0.2rem; cursor: pointer; opacity: 1; transition: background 0.2s, color 0.2s;"
        :style="!canSubmit ? 'opacity:0.5;cursor:not-allowed;' : ''"
      >
        {{ canSubmit ? '🚀 Calculer mon état !' : '📝 Complète le formulaire' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DrinkCarousel from './DrinkCarousel.vue'
import DrinkCard from './DrinkCard.vue'
import { DrinkData, FormData, DrinkTemplate } from '../types'

interface Props {
  savedData?: FormData | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [formData: FormData]
}>()

const selectedDrinks = ref<DrinkData[]>([])
const weight = ref<number>(70)

const canSubmit = computed(() => {
  return selectedDrinks.value.length > 0 && 
         weight.value > 0 && 
         selectedDrinks.value.every(drink => 
           drink.quantity > 0 && 
           drink.lastSipTime instanceof Date
         )
})

const addDrink = (drinkTemplate: DrinkTemplate) => {
  const newDrink: DrinkData = {
    ...drinkTemplate,
    id: `${drinkTemplate.id}-${Date.now()}`,
    quantity: 1,
    lastSipTime: new Date()
  }
  selectedDrinks.value.push(newDrink)
}

const updateDrink = (updatedDrink: DrinkData) => {
  const index = selectedDrinks.value.findIndex(d => d.id === updatedDrink.id)
  if (index !== -1) {
    selectedDrinks.value[index] = updatedDrink
  }
}

const removeDrink = (drinkId: string) => {
  selectedDrinks.value = selectedDrinks.value.filter(d => d.id !== drinkId)
}

const submitForm = () => {
  if (canSubmit.value) {
    emit('submit', {
      drinks: selectedDrinks.value,
      weight: weight.value
    })
  }
}

onMounted(() => {
  // Charger les données sauvegardées si disponibles
  if (props.savedData) {
    selectedDrinks.value = props.savedData.drinks
    weight.value = props.savedData.weight
  }
})
</script>