import "@apollo/client"

declare module "@apollo/client" {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface Query {
        errorPolicy: "all"
      }
      interface WatchQuery {
        errorPolicy: "all"
      }
      interface Mutate {
        errorPolicy: "all"
      }
    }
  }
}
