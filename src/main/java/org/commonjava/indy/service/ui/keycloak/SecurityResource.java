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
package org.commonjava.indy.service.ui.keycloak;

import org.commonjava.indy.service.ui.exception.IndyUIException;
import org.commonjava.indy.service.ui.jaxrs.ResponseHelper;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import java.net.URI;
import java.net.URISyntaxException;

import static javax.ws.rs.core.HttpHeaders.CACHE_CONTROL;

/**
 * @deprecated Will use quarkus native oidc implementation. This is not needed anymore
 */
@Deprecated
@Tag( description = "Security Infrastructure" )
@Path( "/api/security" )
public class SecurityResource
{

    private static final String DISABLED_MESSAGE = "Keycloak is disabled";

    private static final String NO_CACHE = "no-store, no-cache, must-revalidate, max-age=0";

    private final Logger logger = LoggerFactory.getLogger( getClass() );

    @Inject
    SecurityController controller;

    @Inject
    ResponseHelper responseHelper;

    @Operation( description = "Retrieve the keycloak JSON configuration (for use by the UI)" )
    @APIResponses( { @APIResponse( responseCode = "400", description = "Keycloak is disabled" ),
            @APIResponse( responseCode = "200", description = "File retrieval successful" ) } )
    @Path( "/keycloak.json" )
    @Produces( "application/json" )
    @GET
    public Response getKeycloakUiJson()
    {
        logger.debug( "Retrieving Keycloak UI JSON file..." );
        Response response;
        try
        {
            final String content = controller.getKeycloakUiJson();
            if ( content == null )
            {
                response = Response.status( Status.BAD_REQUEST )
                                   .entity( DISABLED_MESSAGE )
                                   .header( CACHE_CONTROL, NO_CACHE )
                                   .build();
            }
            else
            {
                response = Response.ok( content ).header( CACHE_CONTROL, NO_CACHE ).build();
            }
        }
        catch ( final IndyUIException e )
        {
            logger.error( String.format( "Failed to load client-side keycloak.json. Reason: %s", e.getMessage() ), e );
            response = responseHelper.formatResponse( e );
        }

        return response;
    }

    @Operation( description = "Retrieve the keycloak init Javascript (for use by the UI)" )
    @APIResponse( responseCode = "200", description = "Always return 200 whether Keycloak is disabled or not" )
    @Path( "/keycloak-init.js" )
    @Produces( "text/javascript" )
    @GET
    public Response getKeycloakInit()
    {
        logger.debug( "Retrieving Keycloak UI-init Javascript file..." );
        Response response;
        try
        {
            response = Response.ok( controller.getKeycloakInit() ).header( CACHE_CONTROL, NO_CACHE ).build();
        }
        catch ( final IndyUIException e )
        {
            logger.error( String.format( "Failed to load keycloak-init.js. Reason: %s", e.getMessage() ), e );
            response = responseHelper.formatResponse( e );
        }

        return response;
    }

    @Operation( description = "Retrieve the keycloak Javascript adapter (for use by the UI)" )
    @APIResponses( { @APIResponse( responseCode = "200",
                                   description = "Keycloak is disabled, return a Javascript comment to this effect." ),
            @APIResponse( responseCode = "307",
                          description = "Redirect to keycloak server to load Javascript adapter." ) } )
    @Path( "/keycloak.js" )
    @Produces( "text/javascript" )
    @GET
    public Response getKeycloakJs()
    {
        logger.debug( "Retrieving Keycloak Javascript adapter..." );
        Response response;
        try
        {
            final String url = controller.getKeycloakJs();
            if ( url == null )
            {
                response = Response.ok( "/* " + DISABLED_MESSAGE + "; loading of keycloak.js blocked. */" )
                                   .header( CACHE_CONTROL, NO_CACHE )
                                   .build();
            }
            else
            {
                response = Response.temporaryRedirect( new URI( url ) ).build();
            }
        }
        catch ( final IndyUIException | URISyntaxException e )
        {
            logger.error( String.format( "Failed to load keycloak.js. Reason: %s", e.getMessage() ), e );
            response = responseHelper.formatResponse( e );
        }

        return response;
    }

}
