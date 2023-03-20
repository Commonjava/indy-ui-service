/**
 * Copyright (C) 2023 Red Hat, Inc. (https://github.com/Commonjava/indy-ui-service)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.commonjava.indy.service.ui.conf;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;
import io.smallrye.config.WithName;

import javax.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
@ConfigMapping( prefix = "keycloak" )
public interface KeycloakConfig
{
    String KEYCLOAK_REALM = "keycloak.realm";

    String KEYCLOAK_URL = "keycloak.url";

    String KEYCLOAK_SERVER_RESOURCE = "keycloak.serverResource";

    String KEYCLOAK_UI_RESOURCE = "keycloak.uiResource";

    String KEYCLOAK_SERVER_CREDENTIAL_SECRET = "keycloak.serverCredentialSecret";

    String KEYCLOAK_REALM_PUBLIC_KEY = "keycloak.realmPublicKey";

    @WithName( "enabled" )
    @WithDefault( "false" )
    boolean isEnabled();

    @WithName( "uiResource" )
    Optional<String> uiResource();

    @WithName( "serverResource" )
    Optional<String> serverResource();

    @WithName( "realmPublicKey" )
    Optional<String> realmPublicKey();

    @WithName( "uiJson" )
    Optional<String> keycloakUiJson();

    @WithName( "realm" )
    Optional<String> realm();

    @WithName( "url" )
    Optional<String> url();
}
