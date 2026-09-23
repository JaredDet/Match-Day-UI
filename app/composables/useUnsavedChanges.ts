import type { Ref } from "vue";

export function useUnsavedChanges(
  dirty: Ref<boolean>,
  message = "Tienes cambios sin guardar. ¿Quieres salir de esta página?",
) {
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!dirty.value) return;
    event.preventDefault();
    event.returnValue = "";
  };
  onMounted(() => window.addEventListener("beforeunload", beforeUnload));
  onBeforeUnmount(() =>
    window.removeEventListener("beforeunload", beforeUnload),
  );
  onBeforeRouteLeave(() => !dirty.value || window.confirm(message));
}
