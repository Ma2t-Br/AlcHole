<template>
  <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span class="text-3xl">{{ drink.emoji }}</span>
        <div>
          <h4 class="text-white font-semibold">{{ drink.name }}</h4>
          <p class="text-white/70 text-sm">{{ drink.volume }}ml - {{ drink.alcoholPercentage }}°</p>
        </div>
      </div>
      <button
        @click="removeDrink"
        class="text-red-400 hover:text-red-300 transition-colors p-2"
      >
        ❌
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Quantity -->
      <div>
        <label class="block text-white text-sm font-medium mb-2">Quantité</label>
        <div class="flex items-center space-x-2">
          <button
            @click="decrementQuantity"
            class="w-10 h-10 bg-white/20 rounded-lg text-white font-bold hover:bg-white/30 transition-colors"
          >
            -
          </button>
          <span class="text-white text-lg font-semibold min-w-[3rem] text-center">
            {{ localDrink.quantity }}
          </span>
          <button
            @click="incrementQuantity"
            class="w-10 h-10 bg-white/20 rounded-lg text-white font-bold hover:bg-white/30 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <!-- Time -->
      <div>
        <label class="block text-white text-sm font-medium mb-2">Dernière gorgée</label>
        <input
          v-model="timeString"
          @change="updateTime"
          type="time"
          class="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { DrinkData } from '../types'

interface Props {
  drink: DrinkData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [drink: DrinkData]
  remove: [drinkId: string]
}>()

const localDrink = ref<DrinkData>({ ...props.drink })

const timeString = computed({
  get: () => {
    const date = localDrink.value.lastSipTime
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },
  set: (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    const newDate = new Date()
    newDate.setHours(hours, minutes, 0, 0)
    localDrink.value.lastSipTime = newDate
    emit('update', { ...localDrink.value })
  }
})

const incrementQuantity = () => {
  localDrink.value.quantity++
  emit('update', { ...localDrink.value })
}

const decrementQuantity = () => {
  if (localDrink.value.quantity > 1) {
    localDrink.value.quantity--
    emit('update', { ...localDrink.value })
  }
}

const updateTime = () => {
  emit('update', { ...localDrink.value })
}

const removeDrink = () => {
  emit('remove', props.drink.id)
}

watch(() => props.drink, (newDrink) => {
  localDrink.value = { ...newDrink }
}, { deep: true })
</script>