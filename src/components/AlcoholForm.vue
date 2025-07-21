<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
    <div class="space-y-8">
      <!-- Drink Selection -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-6 text-center">
          🍻 Sélectionne tes boissons
        </h2>
        
        <!-- Drink Carousel -->
        <DrinkCarousel @select="addDrink" />
        
        <!-- Selected Drinks -->
        <div v-if="selectedDrinks.length > 0" class="mt-8">
          <h3 class="text-xl font-semibold text-white mb-4">Boissons sélectionnées :</h3>
          <div class="space-y-4">
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
      <div>
        <label class="block text-white text-lg font-semibold mb-3">
          ⚖️ Ton poids (kg)
        </label>
        <input
          v-model.number="weight"
          type="number"
          min="30"
          max="200"
          class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          placeholder="Ex: 70"
        />
      </div>

      <!-- Submit Button -->
      <button
        @click="submitForm"
        :disabled="!canSubmit"
        class="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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