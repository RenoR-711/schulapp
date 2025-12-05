<template>
    <nav class="sub-nav">
        <button 
            @click="prevWoche" 
            :disabled="shift === 0" 
            class="subnav-btn"
        >
            <img :src="iconCircleLeft" class="icon" alt="zurück" />
            <span>Woche -</span>
        </button>

        <button @click="aktWoche" class="subnav-btn">
            <img :src="iconCheck" class="icon" alt="aktuell" />
            <span>Heute</span>
        </button>

        <button 
            @click="nextWoche" 
            :disabled="shift >= maxShift" 
            class="subnav-btn"
        >
            <img :src="iconCircleRight" class="icon" alt="weiter" />
            <span>Woche +</span>
        </button>
    </nav>
</template>

<script setup>
import { computed, defineProps } from "vue";
import { useRouter, useRoute } from "vue-router";

import iconCircleLeft from "@/assets/images/icon-circleleft.png";
import iconCheck from "@/assets/images/icon-check.png";
import iconCircleRight from "@/assets/images/icon-circleright.png";

const props = defineProps({
    maxShift: { type: Number, default: 10 }
});

const router = useRouter();
const route = useRoute();

/* Always convert to Number to avoid route string issues */
const shift = computed(() => {
    const s = Number(route.params.shift);
    return isNaN(s) ? 0 : s;
});

/* Navigation */
const prevWoche = () => {
    if (shift.value > 0) {
        router.push({ name: "speiseplan", params: { shift: shift.value - 1 } });
    }
};

const aktWoche = () => {
    router.push({ name: "speiseplan", params: { shift: 0 } });
};

const nextWoche = () => {
    if (shift.value < props.maxShift) {
        router.push({ name: "speiseplan", params: { shift: shift.value + 1 } });
    }
};
</script>

<style scoped>
.sub-nav {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 0.35rem;
    background: #ffffffee;
    backdrop-filter: blur(4px);
    border-top: 1px solid #ddd;
    z-index: 50;
}

.subnav-btn {
    flex: 1;
    margin: 0 0.25rem;
    padding: 0.5rem 0.25rem;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    transition: all 0.15s ease;
}

.subnav-btn:active {
    transform: scale(0.97);
}

.subnav-btn:disabled {
    opacity: 0.4;
    transform: none;
    cursor: not-allowed;
}

.icon {
    width: 20px;
    height: 20px;
}
</style>
