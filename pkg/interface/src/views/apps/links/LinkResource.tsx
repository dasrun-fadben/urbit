import React, { useEffect } from 'react';
import { Box, Col, Center, LoadingSpinner, Text } from '@tlon/indigo-react';
import { Switch, Route, Link } from 'react-router-dom';
import bigInt from 'big-integer';

import GlobalApi from '~/logic/api/global';
import { StoreState } from '~/logic/store/type';
import { RouteComponentProps } from 'react-router-dom';

import { LinkItem } from './components/LinkItem';
import { LinkWindow } from './LinkWindow';
import { Comments } from '~/views/components/Comments';

import './css/custom.css';
import { Association } from '@urbit/api/metadata';

const emptyMeasure = () => {};

type LinkResourceProps = StoreState & {
  association: Association;
  api: GlobalApi;
  baseUrl: string;
} & RouteComponentProps;

export function LinkResource(props: LinkResourceProps) {
  const {
    association,
    api,
    baseUrl,
    graphs,
    contacts,
    groups,
    associations,
    graphKeys,
    unreads,
    pendingIndices,
    storage,
    history
  } = props;

  const rid = association.resource;

  const relativePath = (p: string) => `${baseUrl}/resource/link${rid}${p}`;

  const [, , ship, name] = rid.split('/');
  const resourcePath = `${ship.slice(1)}/${name}`;
  const resource = associations.graph[rid]
    ? associations.graph[rid]
    : { metadata: {} };
  const group = groups[resource?.group] || {};

  const graph = graphs[resourcePath] || null;

  useEffect(() => {
    api.graph.getGraph(ship, name);
  }, [association]);

  const resourceUrl = `${baseUrl}/resource/link${rid}`;
  if (!graph) {
    return <Center width='100%' height='100%'><LoadingSpinner /></Center>;
  }

  return (
    <Col alignItems="center" height="100%" width="100%" overflowY="hidden">
      <Switch>
        <Route
          exact
          path={relativePath('')}
          render={(props) => {
            return (
              <LinkWindow
                key={rid}
                storage={storage}
                association={resource}
                contacts={contacts}
                resource={resourcePath}
                graph={graph}
                unreads={unreads}
                baseUrl={resourceUrl}
                group={group}
                path={resource.group}
                pendingSize={Object.keys(pendingIndices || {}).length}
                api={api}
                mb={3}
              />
            );
          }}
        />
        <Route
          path={relativePath('/:index(\\d+)/:commentId?')}
          render={(props) => {
            const index = bigInt(props.match.params.index);
            const editCommentId = props.match.params.commentId || null;

            if (!index) {
              return <div>Malformed URL</div>;
            }

            const node = graph ? graph.get(index) : null;

            if (!node) {
              return <Box>Not found</Box>;
            }
            return (
              <Col alignItems="center" overflowY="auto" width="100%">
              <Col width="100%" p={3} maxWidth="768px">
                <Link to={resourceUrl}><Text px={3} bold>{'<- Back'}</Text></Link>
                <LinkItem
                  contacts={contacts}
                  key={node.post.index}
                  resource={resourcePath}
                  node={node}
                  baseUrl={resourceUrl}
                  unreads={unreads}
                  group={group}
                  path={resource?.group}
                  api={api}
                  mt={3}
                  measure={emptyMeasure}
                />
                <Comments
                  ship={ship}
                  name={name}
                  comments={node}
                  resource={resourcePath}
                  association={association}
                  unreads={unreads}
                  contacts={contacts}
                  api={api}
                  editCommentId={editCommentId}
                  history={props.history}
                  baseUrl={`${resourceUrl}/${props.match.params.index}`}
                  group={group}
                  px={3}
                />
              </Col>
            </Col>
            );
          }}
        />
      </Switch>
    </Col>
  );
}
