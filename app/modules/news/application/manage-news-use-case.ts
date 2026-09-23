import type { NewsRepository, SaveNewsInput } from "~/modules/news/domain/news-repository";

export class ManageNewsUseCase {
  constructor(private readonly news: NewsRepository) {}
  save(input: SaveNewsInput, id?: string) {
    return id ? this.news.update(id, input) : this.news.create(input);
  }
  publish(id: string) {
    return this.news.publish(id);
  }
  schedule(id: string, scheduledAt: string) {
    return this.news.schedule(id, scheduledAt);
  }
  unschedule(id: string) {
    return this.news.unschedule(id);
  }
  delete(id: string) {
    return this.news.delete(id);
  }
}
