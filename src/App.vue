<template>
  <div id="app">
    <div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <!-- Header -->
      <header class="text-center py-8">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🍺 Sobriété Timer
        </h1>
        <p class="text-xl text-white/90 max-w-2xl mx-auto px-4">
          Calcule ton temps restant avant d'être sobre !
        </p>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 pb-8">
        <transition name="fade" mode="out-in">
          <!-- Form Page -->
          <div v-if="!showResults" key="form" class="max-w-4xl mx-auto">
            <AlcoholForm @submit="handleFormSubmit" :saved-data="savedData" />
          </div>

          <!-- Results Page -->
          <div v-else key="results" class="max-w-2xl mx-auto">
            <ResultsDisplay 
              :bac="bloodAlcoholContent"
              :timer-data="timerData"
              @reset="resetApp"
              @save="saveData"
            />
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AlcoholForm from './components/AlcoholForm.vue'
import ResultsDisplay from './components/ResultsDisplay.vue'
import { DrinkData, FormData, TimerData } from './types'

const showResults = ref(false)
const bloodAlcoholContent = ref(0)
const timerData = ref<TimerData>({
  hoursRemaining: 0,
  minutesRemaining: 0,
  lastSipTime: new Date(),
  targetTime: new Date()
})
const savedData = ref<FormData | null>(null)

const calculateBAC = (drinks: DrinkData[], weight: number): number => {
  let totalAlcohol = 0
  
  drinks.forEach(drink => {
    // Formule : (volume boisson * quantité * degré boisson * 0.8) / (0.7 * poids)
    const alcoholContent = (drink.volume * drink.quantity * (drink.alcoholPercentage/100) * 0.8) / (0.7 * weight)
    totalAlcohol += alcoholContent
    console.log("BAC = " + drink.volume + ", " + drink.quantity + ", " + drink.alcoholPercentage + ", " + weight + ", ")
  })
  
  console.log(totalAlcohol)
  return totalAlcohol
}

const calculateTimer = (bac: number, lastSipTime: Date): TimerData => {
  // Formule : (quantité résultante - 0.5) / 0.1 (en heures)
  const hoursToSober = Math.max(0, (bac - 0.5) / 0.1)
  
  // Calculer le temps cible basé sur la dernière gorgée
  const targetTime = new Date(lastSipTime.getTime() + (hoursToSober * 60 * 60 * 1000))
  
  // Calculer le temps restant
  const now = new Date()
  const timeRemaining = Math.max(0, targetTime.getTime() - now.getTime())
  
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    hoursRemaining,
    minutesRemaining,
    lastSipTime,
    targetTime
  }
}

const handleFormSubmit = (formData: FormData) => {
  // Calculer la quantité d'alcool dans le sang
  bloodAlcoholContent.value = calculateBAC(formData.drinks, formData.weight)
  
  // Trouver l'heure de la dernière gorgée (la plus récente)
  const lastSipTime = formData.drinks.reduce((latest, drink) => {
    return drink.lastSipTime > latest ? drink.lastSipTime : latest
  }, new Date(0))
  
  // Calculer le timer
  timerData.value = calculateTimer(bloodAlcoholContent.value, lastSipTime)
  
  showResults.value = true
}

const resetApp = () => {
  showResults.value = false
  bloodAlcoholContent.value = 0
  savedData.value = null
  localStorage.removeItem('sobrietyTimerData')
}

const saveData = (formData: FormData) => {
  const dataToSave = {
    ...formData,
    bac: bloodAlcoholContent.value,
    timerData: timerData.value,
    savedAt: new Date().toISOString()
  }
  
  localStorage.setItem('sobrietyTimerData', JSON.stringify(dataToSave))
}

onMounted(() => {
  // Vérifier s'il y a des données sauvegardées
  const saved = localStorage.getItem('sobrietyTimerData')
  if (saved) {
    try {
      const parsedData = JSON.parse(saved)
      
      // Vérifier si les données sont encore valides (moins de 24h)
      const savedTime = new Date(parsedData.savedAt)
      const now = new Date()
      const hoursSinceSaved = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceSaved < 24) {
        savedData.value = parsedData
        
        // Si le timer était encore actif, l'afficher
        if (parsedData.timerData && parsedData.timerData.hoursRemaining > 0) {
          bloodAlcoholContent.value = parsedData.bac
          timerData.value = calculateTimer(parsedData.bac, new Date(parsedData.timerData.lastSipTime))
          showResults.value = true
        }
      } else {
        // Supprimer les données expirées
        localStorage.removeItem('sobrietyTimerData')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données sauvegardées:', error)
    }
  }
})
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>