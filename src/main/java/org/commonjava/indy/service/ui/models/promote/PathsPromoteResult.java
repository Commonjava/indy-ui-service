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
package org.commonjava.indy.service.ui.models.promote;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.Collections;
import java.util.Set;

/**
 * Result of a promotion attempt. If success, the pending paths and error will be <b>null</b>.
 * Otherwise, these are populated to support the resume feature.
 */
public class PathsPromoteResult
        extends AbstractPromoteResult<PathsPromoteResult>
{

    @Schema( description = "Original request (useful for resuming promotion after an error has been corrected)" )
    private PathsPromoteRequest request;

    @Schema( description = "List of paths that could NOT be promoted, in the event of an error" )
    private Set<String> pendingPaths;

    @Schema( description = "List of paths that were successfully promoted" )
    private Set<String> completedPaths;

    @Schema( description = "List of paths that were skipped (path already exists in target location)" )
    private Set<String> skippedPaths;

    public PathsPromoteResult()
    {
    }

    public PathsPromoteResult( final PathsPromoteRequest request, final Set<String> pending, final Set<String> complete,
                               final Set<String> skipped, final String error, ValidationResult validations )
    {
        super( error, validations );
        this.request = request;
        this.pendingPaths = pending;
        this.completedPaths = complete;
        this.skippedPaths = skipped;
    }

    public PathsPromoteResult( final PathsPromoteRequest request, final Set<String> pending, final Set<String> complete,
                               final Set<String> skipped, final ValidationResult validations )
    {
        this( request, pending, complete, skipped, null, validations );
    }

    public PathsPromoteResult( PathsPromoteRequest request )
    {
        this.request = request;
    }

    public PathsPromoteResult( PathsPromoteRequest request, String error )
    {
        this.request = request;
        this.error = error;
    }

    public Set<String> getPendingPaths()
    {
        return pendingPaths == null ? Collections.<String>emptySet() : pendingPaths;
    }

    public void setPendingPaths( final Set<String> pendingPaths )
    {
        this.pendingPaths = pendingPaths;
    }

    public Set<String> getCompletedPaths()
    {
        return completedPaths == null ? Collections.<String>emptySet() : completedPaths;
    }

    public void setCompletedPaths( final Set<String> completedPaths )
    {
        this.completedPaths = completedPaths;
    }

    public Set<String> getSkippedPaths()
    {
        return skippedPaths == null ? Collections.<String>emptySet() : skippedPaths;
    }

    public void setSkippedPaths( Set<String> skippedPaths )
    {
        this.skippedPaths = skippedPaths;
    }

    public PathsPromoteRequest getRequest()
    {
        return request;
    }

    public void setRequest( final PathsPromoteRequest request )
    {
        this.request = request;
    }

    @Override
    public String toString()
    {
        return "PathsPromoteResult{" + "resultCode='" + resultCode + '\'' + ", validations=" + validations + ", error='"
                + error + '\'' + ", request=" + request + ", pendingPaths=" + pendingPaths + ", completedPaths="
                + completedPaths + ", skippedPaths=" + skippedPaths + '}';
    }
}
