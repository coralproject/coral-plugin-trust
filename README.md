# Trust Plugin for Talk

Trust enables moderators to act on the actions and
beheviours of their users.

It currently provides the following features:

- Tracks user karma for how their flagged comments are handled.
- Tracks flagging user karma if the moderators agree/disagree with the flagging
  action.
- Marks unreliable commenters comments with a `PREMOD` status which will prevent
  them from loading in the stream until a moderator can approve them.

## Configuration

The Trust Plugin requries that the following configuration variables are in the
environment:

- `TRUST_RELIABLE_THRESHOLD` - The number of karma points associated with positive
  actions that would result in that particular user being labled as reliable
  for that category. _i.e., if the value was `5`, then a user who had flagged
  `6` comments where the moderators have agreed with their flag (rejected the
  comment) would then be marked as reliable_.
- `TRUST_UNRELIABLE_THRESHOLD` - The number of karma points associated with negative
  actions that would result in that particular user being labled as unreliable
  for that category. _i.e., if the value was `5`, then a user who had flagged
  `6` comments where the moderators have disagreed with their flag (accepted the
  comment and ignored the flag) would then be marked as unreliable_.

## Database

We keep track of user actions by adding a new field to users metadata called
`trust`. We store the following shape there:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "Trust Metadata Object",
  "type": "object",
  "properties": {
    "flag": {
      "description": "Flag action data",
      "type": "object",
      "properties": {
        "karma": {
          "description": "Counts positive and negative actions related to flags made by the user",
          "type": "number"
        }
      },
      "required": [
        "karma"
      ]
    },
    "comment": {
      "description": "Comment action data",
      "type": "object",
      "properties": {
        "karma": {
          "description": "Counts positive and negative actions related to comments made by the user",
          "type": "number"
        }
      },
      "required": [
        "karma"
      ]
    }
  },
  "required": [
    "flag",
    "comment"
  ]
}
```

## License

    Copyright 2016 Mozilla Foundation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

    See the License for the specific language governing permissions and limitations under the License.