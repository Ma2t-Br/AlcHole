<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
    <div class="text-center space-y-8">
      <!-- BAC Display -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-4">
          🩸 Ton taux d'alcoolémie
        </h2>
        <div class="text-6xl font-bold mb-2" :class="bacColorClass">
          {{ bac.toFixed(2) }} g/L
        </div>
        <p class="text-white/80" v-html="bacStatusMessage"></p>
      </div>

      <!-- Timer Display -->
      <div v-if="timerData.hoursRemaining > 0 || timerData.minutesRemaining > 0">
        <h3 class="text-2xl font-bold text-white mb-4">
          ⏰ Temps avant sobriété
        </h3>
        <div class="bg-black/30 rounded-2xl p-6 mb-4">
          <div class="text-5xl font-mono font-bold text-green-400 mb-2">
            {{ displayTime }}
          </div>
          <p class="text-white/80">
            Tu seras sobre vers <strong>{{ targetTimeFormatted }}</strong>
          </p>
        </div>
        <TimerProgress :timer-data="timerData" />
      </div>

      <!-- Already Sober -->
      <div v-else class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-3xl font-bold text-green-400 mb-2">
          Tu es sobre !
        </h3>
        <p class="text-white/80">
          Tu peux reprendre tes activités normalement.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="saveResults"
          class="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          💾 Sauvegarder
        </button>
        <button
          @click="reset"
          class="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          🔄 Nouveau calcul
        </button>
      </div>

      <!-- Warning -->
      <div class="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mt-6">
        <p class="text-red-200 text-sm">
          ⚠️ <strong>Attention :</strong> Ce calcul est approximatif et ne doit pas être utilisé pour prendre des décisions importantes concernant la conduite ou d'autres activités.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import TimerProgress from './TimerProgress.vue'
import { TimerData } from '../types'

interface Props {
  bac: number
  timerData: TimerData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reset: []
  save: [formData: any]
}>()

const currentTime = ref(new Date())
let timeInterval: number | null = null

const bacColorClass = computed(() => {
  if (props.bac < 0.5) return 'text-green-400'
  if (props.bac < 0.8) return 'text-yellow-400'
  if (props.bac < 1.5) return 'text-orange-400'
  return 'text-red-400'
})

const bacStatusMessage = computed(() => {
  if (props.bac < 0.5) return '✅ <strong>Sobre</strong> - Tu peux conduire'
  if (props.bac < 0.8) return '⚠️ <strong>Légèrement alcoolisé</strong> - Évite de conduire'
  if (props.bac < 1.5) return '🚫 <strong>Alcoolisé</strong> - Ne conduis pas !'
  return '🆘 <strong>Très alcoolisé</strong> - Danger ! Reste en sécurité'
})

const displayTime = computed(() => {
  const now = currentTime.value
  const target = new Date(props.timerData.targetTime)
  const remaining = Math.max(0, target.getTime() - now.getTime())
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

const targetTimeFormatted = computed(() => {
  return props.timerData.targetTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const saveResults = () => {
  emit('save', {
    bac: props.bac,
    timerData: props.timerData
  })
  
  // Feedback visuel
  const button = event?.target as HTMLButtonElement
  if (button) {
    const originalText = button.innerHTML
    button.innerHTML = '✅ Sauvegardé !'
    setTimeout(() => {
      button.innerHTML = originalText
    }, 2000)
  }
}

const reset = () => {
  emit('reset')
}

onMounted(() => {
  // Mettre à jour l'heure toutes les secondes
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>