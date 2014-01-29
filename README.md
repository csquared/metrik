# metrik

Metrics aggregator for logfmt-style metrics

Assumes a single `source`

Follows: [https://github.com/ryandotsmith/l2met/wiki/Usage](l2met guidelines)

### `count#`

Sums `count#` style metrics and includes other key=value pairs.

Enable with `-c`

Emitted very `-i` seconds.

### `measure#`

Logs  `count`, `sum`, `min`, `max`, `mean`, `variance`, and `stdev`
for a rolling window.

Enable with `-m`

Set tumbling window size with `-w`


## Usage

  Try it out:

    > npm install -g metrik
    > cat logs.txt
    2013-10-25T20:19:41.739142+00:00 app[web.3]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.739403+00:00 app[web.3]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.739616+00:00 app[web.3]: measure#products_usage_events_close=0.070309922ms
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.799577+00:00 app[web.14]: measure#products_usage_events_open=0.010993464ms
    2013-10-25T20:19:41.826215+00:00 app[web.40]: count#vault_usage.http_201=1

### `count#`

    > cat logs.txt | metrik -c

    count#vault_usage.http_201=3
    count#vault_usage.http_2xx=2
    units=ms sample#products_usage_events_close.mean=0.070309922 sample#products_usage_events_close.median=0.070309922 sample#products_usage_events_close.perc95= sample#products_usage_events_close.perc99= now=1383021881431 n=1
    units=ms sample#products_usage_events_open.mean=0.010993464 sample#products_usage_events_open.median=0.010993464 sample#products_usage_events_open.perc95= sample#products_usage_events_open.perc99= now=1383021881431 n=1


### `measure#`


## Use it on your dyno:

  web: bundle exec ruby app.rb | metrik -c
  worker: bin/worker | metrik -m
