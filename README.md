# metrik

Metrics aggregator for logfmt-style metrics

Assumes a single `source`

### `count#`

Sums `count#` style metrics and includes other key=value pairs.

### `measure#`

Emits `mean`, `median`, `perc95`, and `perc99` for `measure#` style metrics
as `sample#` style metrics with configurable separator.

Includes `n` and `units`.

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

    > cat logs.txt | metrik

    count#vault_usage.http_201=3
    count#vault_usage.http_2xx=2
    units=ms sample#products_usage_events_close.mean=0.070309922 sample#products_usage_events_close.median=0.070309922 sample#products_usage_events_close.perc95= sample#products_usage_events_close.perc99= now=1383021881431 n=1
    units=ms sample#products_usage_events_open.mean=0.010993464 sample#products_usage_events_open.median=0.010993464 sample#products_usage_events_open.perc95= sample#products_usage_events_open.perc99= now=1383021881431 n=1

  Use it on your dyno:

    web: bundle exec ruby app.rb | metrik
    worker: bin/worker | metrik
