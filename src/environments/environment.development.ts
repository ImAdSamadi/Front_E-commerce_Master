// export const environment = {
//   productService:"http://10.10.9.137:31286" ,
//   customerService:"http://10.10.9.137:31286" ,
//   KEYCLOAK_SERVER_URL: "http://10.10.9.137:30050/"  ,
//   KEYCLOAK_REALM: "ecom-realm"  ,
//   KEYCLOAK_CLIENT_ID: "ecom-app"
// };


export const environment = {
  /** the docker host ip address instead or localhost **/
  productService:"http://localhost:8087" ,
  customerService:"http://localhost:8086" ,
  reviewService:"http://localhost:8083" ,
  orderService:"http://localhost:8089",
  paymentService:"http://localhost:8082",
  shipmentService:"http://localhost:8085",
  KEYCLOAK_SERVER_URL: "http://localhost:8080/"  ,
  KEYCLOAK_REALM: "ecom-realm"  ,
  KEYCLOAK_CLIENT_ID: "ecom-app"  ,

};
