export default async function (event, context, logger) {
  logger.info(`Invoking Myfn with payload ${JSON.stringify(event.data || {})}`);

  const results = await context.org.dataApi.query(
    "SELECT Id, Name FROM Account"
  );

  logger.info(JSON.stringify(results));

  return results;
}
