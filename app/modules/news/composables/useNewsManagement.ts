import { useRepositories } from "~/core/api/repository-context";
import { ManageNewsUseCase } from "~/modules/news/application/manage-news-use-case";
import type { DemoNews } from "~/modules/news/data/news";
import type { SaveNewsInput } from "~/modules/news/domain/news-repository";

export function useNewsManagement() {
  const repository = useRepositories().news;
  const useCase = new ManageNewsUseCase(repository);
  const query = useAsyncData("news-management", () => repository.list(), {
    default: () => [],
  });
  const details = useState<Record<string, DemoNews>>("news-management-details", () => ({}));
  async function get(id: string) {
    if (!details.value[id]) details.value[id] = await repository.get(id);
    return details.value[id]!;
  }
  async function save(input: SaveNewsInput, id?: string) {
    await useCase.save(input, id);
    if (id) delete details.value[id];
    await query.refresh();
  }
  async function act(
    id: string,
    action: "publish" | "schedule" | "unschedule" | "delete",
    date?: string,
  ) {
    if (action === "publish") await useCase.publish(id);
    else if (action === "schedule") await useCase.schedule(id, new Date(date!).toISOString());
    else if (action === "unschedule") await useCase.unschedule(id);
    else await useCase.delete(id);
    delete details.value[id];
    await query.refresh();
  }
  return {
    items: query.data,
    pending: query.pending,
    get,
    save,
    act,
    refresh: query.refresh,
  };
}
