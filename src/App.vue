<template>
  <div id="app" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: none;">
    <div style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: -1; background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(230,236,240,0.8) 100%);"></div>
    <div class="glass-container" style="max-width: 480px; width: 100%; margin: 0; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <header class="text-center" style="margin-bottom: 1.5rem;">
        <h1 style="font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; color: #222;">🍺 AlcHole</h1>
        <p style="font-size: 1rem; color: #444; margin: 0;">Calcule ton temps restant avant d'être sobre !</p>
      </header>
      <main style="width: 100%;">
        <transition name="fade" mode="out-in">
          <div v-if="!showResults" key="form">
            <AlcoholForm @submit="handleFormSubmit" :saved-data="savedData" />
          </div>
          <div v-else key="results">
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