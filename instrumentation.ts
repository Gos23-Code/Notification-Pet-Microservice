export async function register() {
  // Solo en el runtime de Node (evita que corra en el edge runtime
  // o durante el build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startDomainEventsSubscriber } = await import(
      '@/infrastructure/messaging/pubsub/DomainEventsSubscriber'
    );
    startDomainEventsSubscriber();
  }
}
