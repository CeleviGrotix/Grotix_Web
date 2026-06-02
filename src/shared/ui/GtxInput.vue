<template>
  <div class="gtx-input-wrapper">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      class="gtx-input"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.gtx-input-wrapper {
  width: 100%;
}

.gtx-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #2a2e3f;
  border: 1px solid #363c4f;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.gtx-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.gtx-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>