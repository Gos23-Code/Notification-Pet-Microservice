import { NotificationType } from '../enums/NotificationType';

export class Notification {
  constructor(
    public readonly id: string,
    public userId: string,
    public title: string,
    public message: string,
    public type: NotificationType,
    public read: boolean,
    public sendAt: Date,
    public readonly createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static create(props: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    sendAt: Date;
  }): Notification {
    return new Notification(
      crypto.randomUUID(),
      props.userId,
      props.title,
      props.message,
      props.type,
      false,
      props.sendAt
    );
  }

  markAsRead(): void {
    this.read = true;
    this.updatedAt = new Date();
  }
}