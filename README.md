# `metrik`

Metrics aggregator for logfmt-style metrics


## `count`

Sums `count#` style metrics and includes other key=value pairs.

## Usage

  Try it out:

    > npm install -g metrik
    > heroku logs -t  | metrik
    count#my-app.http.2xx=200 source=production
    count#my-app.metric2=20 source=production

  Use it on your dyno:

    web: bundle exec ruby app.rb | metrik
    worker: bin/worker | metrik
