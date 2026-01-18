import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface LoadingState {
  isLoading: boolean;
  loadingTasks: Set<string>;
}

const initialState: LoadingState = {
  isLoading: false,
  loadingTasks: new Set<string>(),
};

export const LoadingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    startLoading(taskId: string = 'default'): void {
      const tasks = new Set(store.loadingTasks());
      tasks.add(taskId);
      patchState(store, {
        isLoading: true,
        loadingTasks: tasks,
      });
    },

    stopLoading(taskId: string = 'default'): void {
      const tasks = new Set(store.loadingTasks());
      tasks.delete(taskId);
      patchState(store, {
        isLoading: tasks.size > 0,
        loadingTasks: tasks,
      });
    },

    stopAllLoading(): void {
      patchState(store, {
        isLoading: false,
        loadingTasks: new Set<string>(),
      });
    },

    isTaskLoading(taskId: string): boolean {
      return store.loadingTasks().has(taskId);
    },
  }))
);
